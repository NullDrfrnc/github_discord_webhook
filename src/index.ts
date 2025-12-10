/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { PullRequestEvent, PullRequestReviewEvent } from '@octokit/webhooks-types';
import { APIEmbed } from 'discord-api-types/v10';

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const event = request.headers.get('X-GitHub-Event');

    const payload: PullRequestEvent | PullRequestReviewEvent = await request.json();

    if (event === 'pull_request') {
      return handlePullRequest(payload as PullRequestEvent, event);
    }

    if (event === 'pull_request_review') {

    }

    return new Response('OK');
  }
} satisfies ExportedHandler<Env>;

async function handlePullRequest(event: PullRequestEvent, env: Env) {
  const { pull_request, repository, action } = event;
  const embed = basePREmbed(event);

  switch (action) {
    case "opened":
      embed.description = "Nieuwe pullrequest geopend.";
      embed.color = 0x00afff;
      break;
    case "review_requested":
      embed.description = `Review aangevraagd voor **${pull_request.requested_reviewers[0]?.name}**`;
      embed.color = 0x89cff0;
      break;
  }

}

function basePREmbed({ pull_request, repository }: PullRequestEvent | PullRequestReviewEvent): APIEmbed {
  return {
    title: `#${pull_request.number} — ${pull_request.title}`,
    url: pull_request.html_url,
    color: 0xffffff,
    author: {
      name: pull_request.user.login,
      icon_url: pull_request.user.avatar_url
    },
    thumbnail: { url: repository.owner.avatar_url },
    footer: {
      text: `${repository.full_name} — Pull Request`
    },
    fields: [
      {
        name: 'Auteur',
        value: pull_request.user.login,
        inline: true
      },
      {
        name: 'Status',
        value: pull_request.state === 'open' ? 'Open' : 'Gesloten',
        inline: true
      }
    ]
  };
}
