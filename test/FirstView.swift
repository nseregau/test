import SwiftUI

struct FirstView: View {
    var body: some View {
        VStack {
            Text("First Screen")
                .font(.largeTitle)
                .padding()
            Spacer()
        }
        .navigationTitle("First")
    }
}

#Preview {
    FirstView()
}
