export default (success) => {
    const date = new Date()
    logString += `${currentGroupId},${currentGroupName},${currentOperation},${currentNumber},${success},${date.toLocaleDateString()},${date.toLocaleTimeString()}\n`
}
