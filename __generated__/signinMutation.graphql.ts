/**
 * @generated SignedSource<<3bffc371e828f80d61a6f7d074bc86e0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type SigninInput = {
  email: string;
  password: string;
};
export type signinMutation$variables = {
  input: SigninInput;
};
export type signinMutation$data = {
  readonly signin: {
    readonly user: {
      readonly email: string;
      readonly name: string;
    };
  };
};
export type signinMutation = {
  response: signinMutation$data;
  variables: signinMutation$variables;
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
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "email",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "signinMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SigninPayload",
        "kind": "LinkedField",
        "name": "signin",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "signinMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "SigninPayload",
        "kind": "LinkedField",
        "name": "signin",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "User",
            "kind": "LinkedField",
            "name": "user",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
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
    ]
  },
  "params": {
    "cacheID": "b6d0b4cdd1597f58705b4b96469e2baa",
    "id": null,
    "metadata": {},
    "name": "signinMutation",
    "operationKind": "mutation",
    "text": "mutation signinMutation(\n  $input: SigninInput!\n) {\n  signin(input: $input) {\n    user {\n      email\n      name\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6edbc4eb47d49c84806c9d791e1f9407";

export default node;
