import { custom } from "@zodiaceco/sdk/actions";
import config from "../../../zodiac.config";

// `custom` labels a bag of `allow`-kit permissions so the app can show it as a
// single card. The label never reaches the chain.
export default [
  custom({
    label: "User payouts",
    permissions: [
      allow.megaeth.usdm.transfer(
        undefined, // any address allowed as recipient
        c.withinAllowance("usdm_user_payouts"),
      ),
    ],
  }),

  custom({
    label: "Exchange interactions",
    permissions: [
      allow.megaeth.usdm.approve(config.contracts.megaeth.CompositeExchange),
      allow.megaeth.CompositeExchange.depositErc20(
        config.contracts.megaeth.usdm,
      ),
      allow.megaeth.CompositeExchange.withdrawErc20(
        config.contracts.megaeth.usdm,
      ),
      allow.megaeth.CompositeExchange.batchCommands(), // allow all trading commands
    ],
  }),
] satisfies Permissions;
