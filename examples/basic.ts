import { serve } from 'https://deno.land/std@0.134.0/http/server.ts';
import { Controller, Get, Application, Header, Hook } from '../mod.ts';

@Controller()
class SimpleController {
    @Hook(-1)
    preHook() {
        console.log('Do stuff before method request');
    }

    @Get('/hello')
    sayHello(@Header('user-agent') user: string) {
        console.log('Performing request');
        return 'Hello ' + user;
    }

    @Hook(1)
    postHook() {
        console.log('Do stuff after method request');
    }
}

const app: Application = new Application({
    controller: [SimpleController],
    logger: true,
});

await serve(app.handle.bind(app), { port: 8080 });
