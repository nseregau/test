//
//  ContentView.swift
//  test
//
//  Created by Sergii Nesterenko on 10.09.2025.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(
                    gradient: Gradient(colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)]),
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                VStack(spacing: 20) {
                    NavigationLink(destination: FirstView()) {
                        Text("Go to First")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)

                    NavigationLink(destination: SecondView()) {
                        Text("Go to Second")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)

                    NavigationLink(destination: ThirdView()) {
                        Text("Go to Third")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white.opacity(0.8))
                            .cornerRadius(8)
                    }
                    .buttonStyle(.plain)
                    .shadow(radius: 4)
                }
                .padding()
            }
            .navigationTitle("Main Menu")
        }
    }
}

#Preview {
    ContentView()
}
