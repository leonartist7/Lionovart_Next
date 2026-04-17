// This file exists solely to satisfy Hostinger's Phusion Passenger requirement for a server.js file.
// Instead of a buggy custom server, we simply hand execution directly to Next.js's native production server.
process.argv = ['node', 'next', 'start'];
require('next/dist/bin/next');
