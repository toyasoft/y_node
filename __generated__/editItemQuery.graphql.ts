/**
 * @generated SignedSource<<422e2c98302e9e9b883abaad5ee3ea14>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type editItemQuery$variables = {
  id: string;
};
export type editItemQuery$data = {
  readonly item: {
    readonly " $fragmentSpreads": FragmentRefs<"ItemUpdate_item">;
  };
};
export type editItemQuery = {
  response: editItemQuery$data;
  variables: editItemQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "editItemQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Item",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ItemUpdate_item"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editItemQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
            "name": "point",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "e4991b08176e5ce6df0f66669641efbf",
    "id": null,
    "metadata": {},
    "name": "editItemQuery",
    "operationKind": "query",
    "text": "query editItemQuery(\n  $id: ID!\n) {\n  item(id: $id) {\n    ...ItemUpdate_item\n    id\n  }\n}\n\nfragment ItemUpdate_item on Item {\n  id\n  name\n  point\n}\n"
  }
};
})();

(node as any).hash = "685e0f553478c4c31248d91a3f587a88";

export default node;
