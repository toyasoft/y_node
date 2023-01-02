/**
 * @generated SignedSource<<e5ff9172f1da23843b2855c299d6d157>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type OrderCreate_item$data = {
  readonly id: string;
  readonly " $fragmentType": "OrderCreate_item";
};
export type OrderCreate_item$key = {
  readonly " $data"?: OrderCreate_item$data;
  readonly " $fragmentSpreads": FragmentRefs<"OrderCreate_item">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "OrderCreate_item",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Item",
  "abstractKey": null
};

(node as any).hash = "a85da5fe8a49f6da8edeb7bbefaa0898";

export default node;
