/**
 * Label Model returned from GH (Octokit).
 */
export default interface GHLabel {
  id: number,
  node_id: string,
  url: string,
  name: string,
  color: string,
  default: boolean,
  description: string
}