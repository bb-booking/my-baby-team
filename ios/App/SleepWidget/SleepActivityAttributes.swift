import ActivityKit
import Foundation

@available(iOS 16.2, *)
struct SleepActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var startTime: Date
        var sleepType: String // "nap" | "night"
    }
    var childName: String
}
