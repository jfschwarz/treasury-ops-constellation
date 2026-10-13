import { backend_operator } from "./roles";
import { usdm_user_payouts } from "./allowances";

const mega = constellation({
  workspace: "Default workspace",
  label: "Backend Operator",
  chain: 4326, // megaeth
});

const backendSafe = mega.safe["Backend Safe"]({
  nonce: 0n,
  threshold: 2,
  owners: [
    "0xcAF075b4102d96CdF9Bc5A2cEDb170a8b69697E8",
    "0x33D06d961f988017910c5F2bb64C33356f02CC4f",
    "0xD84681429FB6aB3D6BA887Adf82D462b43b7850a",
  ],
  modules: [mega.roles["Backend Operator"]],
});

const backendRoles = mega.roles["Backend Operator"]({
  nonce: 0n,
  target: "0x45C1fF5B82338C5085c22745f7D18d559511B436",
  owner: "0x45C1fF5B82338C5085c22745f7D18d559511B436",
  avatar: "0x45C1fF5B82338C5085c22745f7D18d559511B436",
  roles: { backend_operator },
  allowances: { usdm_user_payouts },
});

export { backendSafe, backendRoles };
