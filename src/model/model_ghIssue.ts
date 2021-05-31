import GHLabel from './model_ghLabel';
import GHUser from './model_ghUser';

export default interface GHIssue {
  url: string,
  repository_url: string,
  labels_url: string,
  comments_url: string,
  events_url: string,
  html_url: string,
  id: number,
  node_id: string,
  number: number,
  title: string,
  user: GHUser,
  labels: GHLabel[],
  state: string,
  locked: false,
  assignee: GHUser,
  assignees: GHUser[],
  // milestone: any, TODO: Refine Milestone Interface
  comments: number,
  created_at: string,
  updated_at: string,
  closed_at: any,
  author_association: string,
  active_lock_reason: any,
  body: string,
  performed_via_github_app: any
}