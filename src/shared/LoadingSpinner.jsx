import "./LoadingSpinner.css"

const LoadingSpinner = ({ size = "medium", color = "#ea1d2c" }) => {
  const sizeClass = {
    small: "spinner-small",
    medium: "spinner-medium",
    large: "spinner-large",
  }[size]

  return (
    <div className={`loading-spinner ${sizeClass}`}>
      <div
        className="spinner"
        style={{
          borderTopColor: color,
        }}
      ></div>
    </div>
  )
}

export default LoadingSpinner


