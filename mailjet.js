import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);

export async function sendAccountBalanceUpdateEmail(
  recepientEmailAddress,
  recipientName,
  walletAddress,
  oldBalance,
  newBalance
) {
  const request = await mailjet
    .post("send", { version: "v3.1" })
    .request({
      Messages: [
        {
          From: {
            Email: "e0415524@u.nus.edu",
            Name: "Near Noti",
          },
          To: [
            {
              Email: recepientEmailAddress,
              Name: recipientName,
            },
          ],
          Subject: "NEAR Account Balance Update",
          HTMLPart: `<body><p>Hey Degen,</p><p>Your NEAR wallet ${walletAddress} changed from ${oldBalance} NEAR to ${newBalance} NEAR.</p><p>Stay SAFU!</p></body>`,
          CustomID: "NEARBalanceUpdateTest",
        },
      ],
    })
    .then((result) => {
      console.log(result.body);
      return true;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
    return request;
}
