import { exec } from 'child_process';
import util from 'util';
import Booking from '#models/booking.model.js';
import Rack from '#models/rack.model.js';
import User from '#models/user.model.js';
import { ApiError } from '#utils/api-error.utils.js';

const execPromise = util.promisify(exec);

// Port range for NoVNC connections
const NOVNC_PORT_START = 6080;
const NOVNC_PORT_END = 6999;
const usedPorts = new Set();

/**
 * Find an available NoVNC port
 */
const findAvailableNoVNCPort = async () => {
	for (let port = NOVNC_PORT_START; port <= NOVNC_PORT_END; port++) {
		if (!usedPorts.has(port)) {
			// Check if port is actually in use on the system
			try {
				const { stdout } = await execPromise(
					`netstat -tuln | grep ":${port} "`
				);
				if (!stdout) {
					usedPorts.add(port);
					return port;
				}
			} catch (error) {
				// netstat returned no results (port is free)
				usedPorts.add(port);
				return port;
			}
		}
	}
	throw new ApiError(503, 'No available NoVNC ports');
};

/**
 * Release a NoVNC port
 */
const releasePort = (port) => {
	usedPorts.delete(port);
};

/**
 * Start NoVNC websockify connection for a booking
 */
const startRackAccess = async (bookingId, userId) => {
	// Find the booking
	const booking = await Booking.findById(bookingId).populate('rack');
	if (!booking) {
		throw new ApiError(404, 'Booking not found');
	}

	// Verify the booking belongs to the user
	if (booking.user.toString() !== userId.toString()) {
		throw new ApiError(403, 'You are not authorized to access this booking');
	}

	// Check if booking is active (current time is within booking window)
	const now = new Date();
	if (now < booking.startTime) {
		throw new ApiError(400, 'Booking has not started yet');
	}
	if (now > booking.endTime) {
		throw new ApiError(400, 'Booking has expired');
	}
	if (booking.status !== 'confirmed') {
		throw new ApiError(400, 'Booking is not confirmed');
	}

	// Check if VNC access is already active
	if (booking.vncAccess?.isActive && booking.vncAccess?.novncPid) {
		// Verify the process is still running
		try {
			process.kill(booking.vncAccess.novncPid, 0);
			// Process is running, return existing connection
			return {
				novncUrl: booking.vncAccess.novncUrl,
				isActive: true,
			};
		} catch (e) {
			// Process is not running, clean up and create new connection
			booking.vncAccess.isActive = false;
			booking.vncAccess.novncPid = undefined;
			booking.vncAccess.novncPort = undefined;
			booking.vncAccess.novncUrl = undefined;
			await booking.save();
		}
	}

	// Get rack VNC connection details
	const rack = booking.rack;
	if (!rack.vncConnection || !rack.vncConnection.host || !rack.vncConnection.port) {
		throw new ApiError(400, 'Rack does not have VNC connection configured');
	}

	const vncHost = rack.vncConnection.host;
	const vncPort = rack.vncConnection.port;
	const vncPassword = rack.vncConnection.password || '';

	// Find available NoVNC port
	let novncPort;
	let pid;
	let reservedPort = null;
	const maxRetries = 3;
	let attempts = 0;

	// NoVNC web directory
	const novncWebDir = process.env.NOVNC_WEB_DIR || '/usr/share/novnc';

	// Certificates (use environment variables or default paths)
	const certPath = process.env.SSL_CERT_PATH || '/home/arr/NEWER/frontend/certificate.txt';
	const keyPath = process.env.SSL_KEY_PATH || '/home/arr/NEWER/frontend/private_key_unencrypted.txt';

	while (attempts < maxRetries) {
		try {
			// Reserve a port
			novncPort = await findAvailableNoVNCPort();
			reservedPort = novncPort;

			// Clean up any existing processes on this port
			try {
				await execPromise(`pkill -f "websockify.*:${novncPort}"`);
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch (cleanupError) {
				// Ignore cleanup errors
			}

			// Start the websockify process
			// Format: websockify --web /path/to/novnc --cert cert.pem --key key.pem PORT TARGET_HOST:TARGET_PORT
			const command = `nohup websockify --web ${novncWebDir} --cert=${certPath} --key=${keyPath} ${novncPort} ${vncHost}:${vncPort} > /tmp/novnc-booking-${bookingId}.log 2>&1 & echo $!`;

			const { stdout } = await execPromise(command);
			pid = parseInt(stdout.trim());
			if (!pid) {
				throw new Error('Failed to get websockify process ID');
			}

			// Allow time for the process to initialize
			await new Promise((resolve) => setTimeout(resolve, 3000));

			// Verify the process is running
			try {
				process.kill(pid, 0);
			} catch (e) {
				// Read log for details
				try {
					const { stdout: logContent } = await execPromise(
						`tail -n 20 /tmp/novnc-booking-${bookingId}.log`
					);
					console.error(`websockify startup log:\n${logContent}`);
				} catch (e2) {
					console.error('Could not read websockify log:', e2);
				}
				throw new Error('websockify process not running after startup');
			}

			// Create NoVNC URL
			const vncURL = process.env.VNC_DOMAIN_NAME || 'acirackrentals.com';
			const novncUrl = `https://${vncURL}:${novncPort}/vnc.html?host=${vncURL}&port=${novncPort}&autoconnect=true&resize=scale&reconnect=true${vncPassword ? `&password=${encodeURIComponent(vncPassword)}` : ''}`;

			// Update booking with VNC access details
			booking.vncAccess = {
				novncUrl,
				novncPort,
				novncPid: pid,
				isActive: true,
				startedAt: new Date(),
			};
			await booking.save();

			console.log(`Successfully started NoVNC for booking ${bookingId}`, {
				pid,
				novncPort,
				novncUrl,
			});

			return {
				novncUrl,
				isActive: true,
			};
		} catch (error) {
			attempts++;
			console.error(
				`Failed to start NoVNC server for booking ${bookingId} (attempt ${attempts}):`,
				error
			);

			// Cleanup on failure
			if (pid) {
				try {
					await execPromise(`kill -9 ${pid}`);
				} catch (cleanupError) {
					// Ignore cleanup errors
				}
			}

			if (reservedPort) {
				try {
					await execPromise(`pkill -f "websockify.*:${reservedPort}"`);
				} catch (cleanupError) {
					// Ignore cleanup errors
				}
				releasePort(reservedPort);
				reservedPort = null;
			}

			if (attempts === maxRetries) {
				throw new ApiError(500, 'Failed to start NoVNC server after multiple attempts');
			}

			// Wait before retrying (exponential backoff)
			await new Promise((resolve) =>
				setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 8000))
			);
		}
	}

	throw new ApiError(500, 'Failed to start NoVNC server');
};

/**
 * Stop NoVNC connection for a booking
 */
const stopRackAccess = async (bookingId, userId) => {
	const booking = await Booking.findById(bookingId);
	if (!booking) {
		throw new ApiError(404, 'Booking not found');
	}

	// Verify the booking belongs to the user
	if (booking.user.toString() !== userId.toString()) {
		throw new ApiError(403, 'You are not authorized to stop this booking');
	}

	// Stop the websockify process if it's running
	if (booking.vncAccess?.novncPid) {
		try {
			await execPromise(`kill -9 ${booking.vncAccess.novncPid}`);
			console.log(`Killed NoVNC process ${booking.vncAccess.novncPid} for booking ${bookingId}`);
		} catch (error) {
			console.error(`Failed to kill NoVNC process: ${error.message}`);
		}

		// Clean up port
		if (booking.vncAccess.novncPort) {
			try {
				await execPromise(`pkill -f "websockify.*:${booking.vncAccess.novncPort}"`);
			} catch (cleanupError) {
				// Ignore cleanup errors
			}
			releasePort(booking.vncAccess.novncPort);
		}
	}

	// Clear VNC access details
	booking.vncAccess = {
		isActive: false,
	};
	await booking.save();

	return { message: 'Rack access stopped successfully' };
};

/**
 * Get booking details with rack information for access page
 */
const getBookingAccessDetails = async (bookingId, userId) => {
	const booking = await Booking.findById(bookingId)
		.populate('rack')
		.populate('user', 'firstName lastName email');

	if (!booking) {
		throw new ApiError(404, 'Booking not found');
	}

	// Verify the booking belongs to the user
	if (booking.user._id.toString() !== userId.toString()) {
		throw new ApiError(403, 'You are not authorized to access this booking');
	}

	return booking;
};

export { startRackAccess, stopRackAccess, getBookingAccessDetails };
