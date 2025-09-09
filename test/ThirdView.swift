import SwiftUI

struct ThirdView: View {
    var body: some View {
        VStack {
            Text("Third Screen")
                .font(.largeTitle)
                .padding()
            Spacer()
        }
        .navigationTitle("Third")
    }
}

#Preview {
    ThirdView()
}
