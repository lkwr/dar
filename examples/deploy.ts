/**
 * This is a example for deno deploy. You can check out this example at https://pterosaur.deno.dev
 */
import { serve } from 'https://deno.land/std@0.134.0/http/server.ts';
import {
    Application,
    Controller,
    Get,
    Header,
    Param,
    Include,
    Res,
    Response,
    Hook,
} from '../mod.ts';

// Our user controller, we include in our root controller
@Controller('/user')
class UserController {
    // simple get request with parameter placeholder (in URLPattern format)
    @Get('/:name')
    getUserByName(@Param('name') name: string) {
        return 'Your name is "' + name + '"';
    }

    // simple get request with header decorator to get a header value
    @Get('/')
    getUserWithoutName(@Header('user-agent') agent: string) {
        return 'Your User-Agent is "' + agent + '"';
    }
}

// Our root controller, which we are passing to our app
@Controller('/', { include: [UserController] })
class RootController {
    // Simple get request on path / (default)
    @Get()
    getRoot() {
        return 'Welcome! This is a simple example of pterosaur deployed on deno deploy. Check /more for more!';
    }

    // Simple get request on path /more
    @Get('/more')
    getMore() {
        return 'You can use /user/:name or /user';
    }

    // Including our UserController //! CURRENTLY NOT WORKING IN DENO DEPLOY -> bug?
    // @Include()
    // includedUser = UserController;

    // We use hook with level = 0; this means after method execution (>= 0 = after method; < 0 = before method)
    @Hook(0)
    notFoundHook(@Res() response: Response) {
        if (response.status == 404) {
            return 'route not found! goto /';
            // you can also use: response.write('route not found! goto /');
        }
    }
}

// Our app which can handle request via app.handle
const app: Application = new Application({
    controller: [RootController],
});

// We use deno std http serve module. But you can use whatever http server you want.
await serve(app.handle.bind(app), { port: 8080 });
