/**
 * @generated SignedSource<<7eb13f9c51273c805f7664ff8ad51912>>
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
    readonly item: {
      readonly id: string;
    };
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
        "concreteType": "Item",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
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
    "cacheID": "2a40ab3996925a2b5026645b4a5d0fe0",
    "id": null,
    "metadata": {},
    "name": "ItemDeleteMutation",
    "operationKind": "mutation",
    "text": "mutation ItemDeleteMutation(\n  $input: DeleteItemInput!\n) {\n  deleteItem(input: $input) {\n    item {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "5018cbc6bd1b14f228d31b3b32a2ef5e";

export default node;
