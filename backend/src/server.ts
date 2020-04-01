import Hexnut from 'hexnut';
import handle from 'hexnut-handle';

const port = 8181;
const app = new Hexnut({ port });

app.use(handle.connect(ctx => {
  ctx.messageCount = 0;
  ctx.send('You are connected!');
}));

app.use(handle.message(ctx => {
  ctx.messageCount += 1;
  ctx.send(`You send a message: ${ctx.message}`);
  ctx.send(`It was message number: ${ctx.messageCount}`);
}));

app.start();

console.log('Running on port:', port);
