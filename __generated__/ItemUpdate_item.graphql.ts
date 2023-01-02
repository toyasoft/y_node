/**
 * @generated SignedSource<<790b0cbeb22d69c71149fffbc3ede1f2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ItemUpdate_item$data = {
  readonly id: string;
  readonly name: string;
  readonly point: number;
  readonly " $fragmentType": "ItemUpdate_item";
};
export type ItemUpdate_item$key = {
  readonly " $data"?: ItemUpdate_item$data;
  readonly " $fragmentSpreads": FragmentRefs<"ItemUpdate_item">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ItemUpdate_item",
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
  "type": "Item",
  "abstractKey": null
};

(node as any).hash = "1c0228c2bd6b1e0e0f118574b64e0653";

export default node;
