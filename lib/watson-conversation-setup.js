/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

'use strict';

require('dotenv').config({
  silent: true
});

/**
 * Setup for Watson Conversation
 *
 * @param {Object} conversationClient - Conversation client
 * @constructor
 */
function WatsonConversationSetup(conversationClient) {
  this.conversationClient = conversationClient;
}

/**
 * Validate or create the Conversation workspace.
 * Sets the global workspaceID when done (or global setupError).
 *
 * If a WORKSPACE_ID is specified in the runtime environment,
 * make sure that workspace exists. If no WORKSPACE_ID is
 * specified then try to find it using a lookup by name.
 * Name will be taken from params.default_name unless overridden
 * using the WORKSPACE_NAME environment variable.
 *
 * If a workspace is not found by ID or name, then try to
 * create one from the JSON in the repository. Use the
 * name as mentioned above so future lookup will find what
 * was created.
 *
 * @param {Object} params - Parameter dictionary as follows.
 * @param {String} params.default_name - Name of app, used as default workspace name when needed
 *                                       to create/find (can be overriden by process.env.WORKSPACE_NAME).
 * @param {Object} params.workspace_json - The workspace JSON to import.
 * @param {function{Error,String}} callback - A callback to capture Error or workspace ID string.
 */
WatsonConversationSetup.prototype.setupConversationWorkspace = async function(params, callback) {
  var workspaceID;

  let list = await this.conversationClient.listWorkspaces();
  if (list.status != 200) {
      console.error('Error during Conversation listWorkspaces(): ', list.statusText);
      callback(new Error('Error. Unable to list workspaces for Conversation: ' + list.statusText));
  } else {
      var workspaces = list.result['workspaces'];
      var validateID = process.env.WORKSPACE_ID;
      var found = false;
      if (validateID) {
        console.log('Validating workspace ID: ', validateID);
        for (let i = 0, size = workspaces.length; i < size; i++) {
          if (workspaces[i]['workspace_id'] === validateID) {
            workspaceID = validateID;
            found = true;
            console.log('Found workspace: ', validateID);
            break;
          }
        }
        if (!found) {
          callback(new Error('Configured WORKSPACE_ID ' + validateID + ' not found!'));
        } else {
          callback(null, workspaceID);
        }
      } else {
        // Find by name, because we probably created it earlier (in the if block) and want to use it on restarts.
        var workspaceName = process.env.WORKSPACE_NAME || params.default_name;
        console.log('Looking for workspace by name: ', workspaceName);
        for (let i = 0, size = workspaces.length; i < size; i++) {
          if (workspaces[i]['name'] === workspaceName) {
            console.log('Found workspace: ', workspaceName);
            workspaceID = workspaces[i]['workspace_id'];
            found = true;
            break;
          }
        }
        if (!found) {
          console.log('Creating Conversation workspace ', workspaceName);
          var ws = params.workspace_json;
          ws['name'] = workspaceName;
          let created = await this.conversationClient.createWorkspace(ws);
          if (created.status != 201) {
              callback(new Error('Failed to create Conversation workspace: ' + created.statusText));
          } else {
              workspaceID = ws['workspace_id'];
              console.log('Successfully created Conversation workspace');
              console.log('  Name: ', ws['name']);
              console.log('  ID:', workspaceID);
              callback(null, workspaceID);
          }
        } else {
          callback(null, workspaceID);
        }
      }
  }
};

module.exports = WatsonConversationSetup;
