import SwiftUI

struct SecondView: View {
    var body: some View {
        VStack {
            Text("Second Screen")
                .font(.largeTitle)
                .padding()
            Spacer()
        }
        .navigationTitle("Second")
    }
}

#Preview {
    SecondView()
}
