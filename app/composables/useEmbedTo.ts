/** Build an in-app link that keeps ?embed=1 so a demo pane stays chrome-free. */
export function useEmbedTo() {
  const embed = useEmbed()
  return (path: string, query: Record<string, string> = {}) => ({
    path,
    query: embed.value ? { ...query, embed: '1' } : query,
  })
}
