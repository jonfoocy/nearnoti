import * as nearAPI from "near-api-js";
import * as cron from "node-cron";
import prompt from "prompt-sync";
import { sendAccountBalanceUpdateEmail } from "./mailjet.js";

var recipientName;
var recepientEmailAddress;
var walletAddress;

const connectionConfig = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};
const conn = await nearAPI.connect(connectionConfig);

async function getAccountDetails(accountId) {
  const response = await conn.connection.provider.query({
    request_type: "view_account",
    finality: "final",
    account_id: walletAddress,
  });
  return response;
}

function getUserDetails() {
  recipientName = prompt()("What is your name? ");
  recepientEmailAddress = prompt()("What is your email? ");
  walletAddress = prompt()("What is the wallet address you want to get alerts for? ");
  console.log("Name: " + recipientName);
  console.log("Email: " + recepientEmailAddress);
  console.log("Wallet: " + walletAddress);
}

var oldBalance;

// every 10s
const checkBalanceCron = cron.schedule("*/10 * * * * *", async () => {
  console.log("Getting account balance for: " + walletAddress);
  const details = await getAccountDetails(walletAddress);
  const formattedAccountBalance = nearAPI.utils.format.formatNearAmount(
    details.amount
  );
  console.log("Account balance: " + formattedAccountBalance);

  if (oldBalance === undefined) {
    oldBalance = formattedAccountBalance;
  } else if (oldBalance !== formattedAccountBalance) {
    const hasEmailSent = await sendAccountBalanceUpdateEmail(
      recepientEmailAddress,
      recipientName,
      walletAddress,
      oldBalance,
      formattedAccountBalance
    );
    console.log("has email sent? " + hasEmailSent);

    if (hasEmailSent) {
      oldBalance = formattedAccountBalance;
    }
  }
}, { scheduled: false });

getUserDetails();
checkBalanceCron.start();
