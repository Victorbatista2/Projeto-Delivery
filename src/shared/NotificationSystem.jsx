"use client"
import { useApp } from "../contexts/AppContext"
import "./NotificationSystem.css"

const NotificationSystem = () => {
  const { state, actions } = useApp()

  if (state.notifications.length === 0) {
    return null
  }

  return (
    <div className="notification-container">
      {state.notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => actions.removeNotification(notification.id)}
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button
              className="notification-close"
              onClick={(e) => {
                e.stopPropagation()
                actions.removeNotification(notification.id)
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationSystem


