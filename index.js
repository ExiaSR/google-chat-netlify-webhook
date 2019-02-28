const { json } = require('micro');
const axios = require('axios');

let { HANGOUT_CHAT_WEBHOOK_URL } = process.env;

let buildBranchDeployCard = ({
  deploymentName,
  reviewTitle,
  reviewUrl,
  previewUrl,
  branch,
  commitHash,
  buildLogUrl,
  committer
}) => ({
  cards: [
    {
      sections: [
        {
          widgets: [
            {
              textParagraph: {
                text: `Successful deploy of <b>${deploymentName}</b>.`
              }
            }
          ]
        },
        {
          widgets: [
            {
              textParagraph: {
                text: `<a href="${reviewUrl}">${reviewTitle}</a>\nOr check out the <a href="${buildLogUrl}">build log</a>`
              }
            },
            {
              keyValue: {
                topLabel: 'Branch',
                content: branch
              }
            },
            {
              keyValue: {
                topLabel: 'Commit',
                content: commitHash
              }
            },
            {
              keyValue: {
                topLabel: 'Committer',
                content: committer
              }
            }
          ]
        },
        {
          widgets: [
            {
              buttons: [
                {
                  textButton: {
                    text: 'Visit the changes live',
                    onClick: {
                      openLink: {
                        url: previewUrl
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});

let buildDeployReviewCard = ({
  deploymentName,
  reviewId,
  reviewTitle,
  reviewUrl,
  previewUrl,
  branch,
  commitHash,
  buildLogUrl,
  committer
}) => ({
  cards: [
    {
      sections: [
        {
          widgets: [
            {
              textParagraph: {
                text: `Successful deploy of <b>${deploymentName}</b>. <i>(deploy review ${reviewId})</i>`
              }
            }
          ]
        },
        {
          widgets: [
            {
              textParagraph: {
                text: `<a href="${reviewUrl}">${reviewTitle}</a>\nOr check out the <a href="${buildLogUrl}">build log</a>`
              }
            },
            {
              keyValue: {
                topLabel: 'Branch',
                content: branch
              }
            },
            {
              keyValue: {
                topLabel: 'Commit',
                content: commitHash
              }
            },
            {
              keyValue: {
                topLabel: 'Committer',
                content: committer
              }
            }
          ]
        },
        {
          widgets: [
            {
              buttons: [
                {
                  textButton: {
                    text: 'Visit the changes live',
                    onClick: {
                      openLink: {
                        url: previewUrl
                      }
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
});

module.exports = async (req, res) => {
  let {
    id: buildId,
    admin_url: adminUrl,
    context,
    state,
    name: deploymentName,
    deploy_ssl_url: previewUrl,
    title: reviewTitle,
    review_id: reviewId,
    review_url: reviewUrl,
    commit_url: commitUrl,
    branch,
    commit_ref: commitHash,
    committer,
    ...rest
  } = await json(req);

  let payload;

  if (context === 'branch-deploy' && state === 'ready') {
    payload = buildBranchDeployCard({
      deploymentName,
      branch,
      reviewTitle,
      reviewUrl: commitUrl,
      previewUrl,
      commitHash: commitHash.substring(0, 8),
      committer,
      buildLogUrl: `${adminUrl}/deploys/${buildId}`
    });
  } else if (context === 'deploy-preview' && state === 'ready') {
    payload = buildDeployReviewCard({
      deploymentName,
      reviewId,
      reviewTitle,
      reviewUrl,
      previewUrl,
      branch,
      commitHash: commitHash.substring(0, 8),
      buildLogUrl: `${adminUrl}/deploys/${buildId}`,
      committer
    });
  }

  try {
    let resp = await axios.post(HANGOUT_CHAT_WEBHOOK_URL, payload);
    console.log(resp.data);
  } catch (err) {
    console.error(err);
  }

  res.end(JSON.stringify({ success: true }));
};
