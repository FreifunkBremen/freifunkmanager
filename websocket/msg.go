package websocket

const (
	MessageTypeConnect = "connect"

	MessageTypeLogin      = "login"
	MessageTypeAuthStatus = "auth_status"
	MessageTypeLogout     = "logout"

	MessageTypeSystemNode  = "node-system"
	MessageTypeCurrentNode = "node-current"
	MessageTypeStats       = "stats"
)
