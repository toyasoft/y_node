/**
 * @generated SignedSource<<82e230f43bc38c339ef363ba87b6d868>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeleteItemInput = {
  id: string;
};
export type ItemDeleteMutation$variables = {
  input: DeleteItemInput;
};
export type ItemDeleteMutation$data = {
  readonly deleteItem: {
    readonly deletedItemId: string;
  };
};
export type ItemDeleteMutation = {
  response: ItemDeleteMutation$data;
  variables: ItemDeleteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "DeleteItemPayload",
    "kind": "LinkedField",
    "name": "deleteItem",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedItemId",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ItemDeleteMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ItemDeleteMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "3a1be5b2df69971445e769d65b1fa36e",
    "id": null,
    "metadata": {},
    "name": "ItemDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ItemDeleteMutation(\n  $input: DeleteItemInput!\n) {\n  deleteItem(input: $input) {\n    deletedItemId\n  }\n}\n"
  }
};
})();

(node as any).hash = "abd9e843e6b1c9b8aec683895ef8e0fa";

export default node;
