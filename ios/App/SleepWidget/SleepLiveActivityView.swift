import WidgetKit
import SwiftUI
import ActivityKit

@available(iOS 16.2, *)
struct SleepLiveActivityView: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: SleepActivityAttributes.self) { context in
            LockScreenSleepView(context: context)
                .activityBackgroundTint(Color.clear)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 6) {
                        Image(systemName: context.state.sleepType == "nap" ? "sun.max.fill" : "moon.fill")
                            .foregroundColor(.mint)
                            .font(.subheadline)
                        Text(context.state.sleepType == "nap" ? "Lur" : "Nattesøvn")
                            .font(.caption.weight(.medium))
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(timerInterval: context.state.startTime...Date.distantFuture, countsDown: false)
                        .font(.system(.callout, design: .rounded, weight: .semibold))
                        .monospacedDigit()
                        .foregroundColor(.mint)
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.childName + " sover")
                        .font(.subheadline.weight(.medium))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 5) {
                        Circle()
                            .fill(Color.mint)
                            .frame(width: 5, height: 5)
                            .opacity(0.7)
                        Text("Live søvnsporing · Melo")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            } compactLeading: {
                Image(systemName: "moon.fill")
                    .foregroundColor(.mint)
                    .font(.caption)
            } compactTrailing: {
                Text(timerInterval: context.state.startTime...Date.distantFuture, countsDown: false)
                    .font(.caption2.weight(.semibold))
                    .monospacedDigit()
                    .foregroundColor(.mint)
                    .frame(maxWidth: 50)
            } minimal: {
                Image(systemName: "moon.fill")
                    .foregroundColor(.mint)
            }
            .widgetURL(URL(string: "meloparents://sovn"))
            .keylineTint(.mint)
        }
    }
}

@available(iOS 16.2, *)
struct LockScreenSleepView: View {
    let context: ActivityViewContext<SleepActivityAttributes>

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(Color.mint.opacity(0.15))
                    .frame(width: 48, height: 48)
                Text(String(context.attributes.childName.prefix(1)))
                    .font(.system(.title2, design: .rounded, weight: .semibold))
                    .foregroundColor(.mint)
            }

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 5) {
                    Image(systemName: context.state.sleepType == "nap" ? "sun.max.fill" : "moon.fill")
                        .font(.caption)
                        .foregroundColor(.mint)
                    Text(context.attributes.childName + (context.state.sleepType == "nap" ? " tager en lur" : " sover"))
                        .font(.subheadline.weight(.medium))
                }
                Text(timerInterval: context.state.startTime...Date.distantFuture, countsDown: false)
                    .font(.system(.title2, design: .rounded, weight: .light))
                    .monospacedDigit()
                    .foregroundColor(.primary)
            }

            Spacer()

            VStack(spacing: 2) {
                Image(systemName: "zzz")
                    .font(.caption)
                    .foregroundColor(.mint.opacity(0.5))
                Text("Melo")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}
