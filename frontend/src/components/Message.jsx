export default function Message({ error, success }) {
  if (error) return <p className="msg msg-error" role="alert">{error}</p>;
  if (success) return <p className="msg msg-ok" role="status">{success}</p>;
  return null;
}
