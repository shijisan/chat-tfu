export function timeAgo(date: Date) {
	const now = new Date().getTime()
	const diff = now - date.getTime()

	const seconds = Math.floor(diff / 1000)
	const minutes = Math.floor(diff / (1000 * 60))
	const hours = Math.floor(diff / (1000 * 60 * 60))
	const days = Math.floor(diff / (1000 * 60 * 60 * 24))

	if (seconds < 60) return `${seconds}s ago`
	if (minutes < 60) return `${minutes}m ago`
	if (hours < 24) return `${hours}h ago`
	return `${days}d ago`
}
