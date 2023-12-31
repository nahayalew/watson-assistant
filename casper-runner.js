/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

require('dotenv').config({ silent: true });

function run() {
    var spawn = require('child_process').spawn;

    var app = require('./app');
    var port = 3000;

    var server = app.listen(port, function() {
        // eslint-disable-next-line no-console
        console.log('Server running on port: %d', port);

        function kill(code) {
            server.close(function() {
                // eslint-disable-next-line no-process-exit
                process.exit(code);
            });
        }

        function runTests() {
            var casper = spawn('npx', ['casperjs', 'test', `${process.env.INIT_CWD}/test/integration/test.mainpage.js`]);
            casper.stdout.pipe(process.stdout);

            casper.on('error', function(error) {
                // eslint-disable-next-line
                console.error(error);
                server.close(function() {
                    process.exit(1);
                });
            });

            casper.on('close', kill);
        }

        runTests();
    });
}

if (process.env.WORKSPACE_ID) {
    run();
} else {
    // eslint-disable-next-line
    console.warn('Skipping casper tests because WORKSPACE_ID is null');
    // TODO: Determine why following station fails in this repo, but not in
    // conversation-simple
    // return;
}
