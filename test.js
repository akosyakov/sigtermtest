// @ts-check
if (process.argv[2]?.startsWith('child')) {
    const alias = process.argv[2].split('-')[1];
    const terminateGracefully = async (code) => {
        console.log(alias + ' received ' + code);
        process.exit(0);
    }
    process.once('SIGINT', terminateGracefully);
    process.once('SIGTERM', terminateGracefully);
    (async () => {
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    })()
} else {
    const terminateGracefully = async (code) => {
        console.log(`parent: ${code} received`)

        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            process.kill(fg.pid, code)
            console.error(`parent: fg should have been terminated already`)
        } catch {
            // no-op expected
        }

        try {
            process.kill(bg.pid, code)
        } catch {
            console.error(`parent: bg should have not been terminated yet`)
        }

        process.exit(0);
    }

    process.once('SIGINT', terminateGracefully);
    process.once('SIGTERM', terminateGracefully);

    const fg = require('child_process').fork(__filename, ['child-fg'], {
        stdio: 'inherit'
    });
    fg.on('error', console.warn);

    const bg = require('child_process').fork(__filename, ['child-bg'], {
        detached: true,
        stdio: 'inherit'
    });
    bg.on('error', console.warn);

    (async () => {
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    })()
}