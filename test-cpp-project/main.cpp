#include <iostream>
#include <string>

// Helper function to demonstrate nested calls
void deepFunction() {
    std::cout << "Deep function called" << std::endl;
    // Set breakpoint here
    int result = 42;
    std::cout << "Result: " << result << std::endl;
}

void pathC() {
    std::cout << "Path C" << std::endl;
    deepFunction();
}

void pathB() {
    std::cout << "Path B" << std::endl;
    deepFunction();
}

void pathA() {
    std::cout << "Path A" << std::endl;
    pathB();
    pathC();
}

void processData(int value) {
    std::cout << "Processing data: " << value << std::endl;
    if (value > 10) {
        pathA();
    } else {
        pathB();
    }
}

int main() {
    std::cout << "Call Stack to PlantUML Test Program" << std::endl;
    
    // First call path
    processData(15);
    
    // Second call path
    processData(5);
    
    return 0;
}
