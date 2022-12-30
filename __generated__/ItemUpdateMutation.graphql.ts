/**
 * @generated SignedSource<<bed4909c6f2a29eb62f7f9e94e271ced>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UpdateItemInput = {
  description?: string | null;
  id: string;
  image?: string | null;
  name: string;
  pric: number;
};
export type ItemUpdateMutation$variables = {
  input: UpdateItemInput;
};
export type ItemUpdateMutation$data = {
  readonly updateItem: {
    readonly item: {
      readonly description: string | null;
      readonly id: string;
      readonly image: string | null;
      readonly name: string;
      readonly price: number;
      readonly username: string | null;
    };
  };
};
export type ItemUpdateMutation = {
  response: ItemUpdateMutation$data;
  variables: ItemUpdateMutation$variables;
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
    "concreteType": "UpdateItemPayload",
    "kind": "LinkedField",
    "name": "updateItem",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "price",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "username",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "image",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "description",
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
    "name": "ItemUpdateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ItemUpdateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "428eb389e8957a3eabc63316bb0a8732",
    "id": null,
    "metadata": {},
    "name": "ItemUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation ItemUpdateMutation(\n  $input: UpdateItemInput!\n) {\n  updateItem(input: $input) {\n    item {\n      id\n      name\n      price\n      username\n      image\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3456030c30b0bf6be06805147c634b3c";

export default node;
