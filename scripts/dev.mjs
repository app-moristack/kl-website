import {spawn} from 'node:child_process';
const args=process.argv.slice(2);
const option=(name,fallback)=>{const i=args.indexOf(name);return i>=0?args[i+1]:fallback;};
const host=option('--host','127.0.0.1');
const port=option('--port',process.env.PORT||'3000');
const child=spawn('php',['artisan','serve',`--host=${host}`,`--port=${port}`],{stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
