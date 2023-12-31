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

var path = require('path');
// load default variables for testing
require('dotenv').config({ path: path.join(__dirname, '../../.env.example') });

var app = require('../../app');
app.server = app.listen(3000);

var request = require('supertest');

describe('express', function() {
  after(() => {
    app.server.close();
  });

  it('load home page when GET /', async function() {
    await request(app).get('/').expect(200);
  });

  it('404 when page not found', async function() {
    await request(app).get('/foo/bar').expect(404);
  });

});
