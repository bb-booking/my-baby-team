import Foundation
import Capacitor
import ActivityKit

@objc(LiveActivityPlugin)
public class LiveActivityPlugin: CAPPlugin {

    @objc func startSleepActivity(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else {
            call.resolve(["started": false, "reason": "iOS 16.2+ required"])
            return
        }

        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            call.resolve(["started": false, "reason": "Live Activities not enabled by user"])
            return
        }

        let childName = call.getString("childName") ?? "Baby"
        let sleepType = call.getString("sleepType") ?? "nap"
        let startTimestamp = call.getDouble("startTime") ?? Double(Date().timeIntervalSince1970 * 1000)
        let startDate = Date(timeIntervalSince1970: startTimestamp / 1000.0)

        // End any existing sleep activity before starting a new one
        endAllActivities()

        let attributes = SleepActivityAttributes(childName: childName)
        let contentState = SleepActivityAttributes.ContentState(
            startTime: startDate,
            sleepType: sleepType
        )

        do {
            let content = ActivityContent(state: contentState, staleDate: nil)
            let activity = try Activity.request(
                attributes: attributes,
                content: content,
                pushType: nil
            )
            call.resolve(["started": true, "id": activity.id])
        } catch {
            call.resolve(["started": false, "reason": error.localizedDescription])
        }
    }

    @objc func endSleepActivity(_ call: CAPPluginCall) {
        guard #available(iOS 16.2, *) else {
            call.resolve()
            return
        }
        endAllActivities()
        call.resolve()
    }

    @available(iOS 16.2, *)
    private func endAllActivities() {
        Task {
            for activity in Activity<SleepActivityAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
        }
    }
}
