#include <iostream>
#include <string>
#include <vector>

// Templated utility class to test template symbol handling in PlantUML
template <typename T>
class Container
{
private:
    T value;

public:
    Container(T val) : value(val) {}

    // Templated method with special symbols <> in signature
    template <typename U>
    U transform(U multiplier)
    {
        std::cout << "Transform<" << typeid(U).name() << "> called" << std::endl;
        // Set breakpoint here to capture template instantiation
        return static_cast<U>(value) * multiplier;
    }

    T getValue() const
    {
        return value;
    }
};

// Class to demonstrate object-oriented call patterns
class DataProcessor
{
private:
    std::string name;

    void deepFunction()
    {
        std::cout << "DataProcessor::deepFunction called" << std::endl;
        // Set breakpoint here
        Container<int> container(42);
        int result = container.transform<int>(2);
        std::cout << "Result: " << result << std::endl;
    }

    void pathC()
    {
        std::cout << "DataProcessor::pathC" << std::endl;
        deepFunction();
    }

    void pathB()
    {
        std::cout << "DataProcessor::pathB" << std::endl;
        deepFunction();
    }

    void pathA()
    {
        std::cout << "DataProcessor::pathA" << std::endl;
        pathB();
        pathC();
    }

public:
    DataProcessor(const std::string &n) : name(n)
    {
        std::cout << "DataProcessor created: " << name << std::endl;
    }

    void processData(int value)
    {
        std::cout << name << "::processData: " << value << std::endl;
        if (value > 10)
        {
            pathA();
        }
        else
        {
            pathB();
        }
    }

    // Templated public method to test template handling
    template <typename T>
    void processVector(const std::vector<T> &data)
    {
        std::cout << "Processing vector<" << typeid(T).name() << "> with "
                  << data.size() << " elements" << std::endl;
        if (!data.empty())
        {
            Container<T> container(data[0]);
            auto result = container.template transform<double>(1.5);
            std::cout << "First element transformed: " << result << std::endl;
        }
    }
};

// Free templated function to test global template handling
template <typename T>
void processGeneric(T value)
{
    std::cout << "processGeneric<" << typeid(T).name() << ">: " << value << std::endl;
    Container<T> container(value);
    auto result = container.template transform<double>(3.14);
    std::cout << "Generic result: " << result << std::endl;
}

int main()
{
    std::cout << "Call Stack to PlantUML Test Program (with Classes & Templates)" << std::endl;

    // Test class-based call paths
    DataProcessor processor("MainProcessor");

    // First call path with value > 10
    processor.processData(15);

    // Second call path with value <= 10
    processor.processData(5);

    // Test templated method with vector
    std::vector<int> intData = {10, 20, 30};
    processor.processVector(intData);

    std::vector<double> doubleData = {1.5, 2.5, 3.5};
    processor.processVector(doubleData);

    // Test free templated function
    processGeneric<int>(100);
    processGeneric<double>(3.14159);

    return 0;
}
