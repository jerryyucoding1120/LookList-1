// To compile: g++ beauty_landing.cpp -o beauty_landing -lsfml-graphics -lsfml-window -lsfml-system
#include <SFML/Graphics.hpp>

int main() {
    sf::RenderWindow window(sf::VideoMode(600, 400), "LookList – Luxury Beauty Marketplace");

    // Gradient background emulation (linear interpolation)
    sf::Image bgImage;
    bgImage.create(600, 400);
    for (unsigned y = 0; y < 400; ++y) {
        for (unsigned x = 0; x < 600; ++x) {
            float t = float(y) / 400.0f;
            sf::Color c(
                static_cast<sf::Uint8>(24 + t * (255 - 24)),
                static_cast<sf::Uint8>(18 + t * (56 - 18)),
                static_cast<sf::Uint8>(43 + t * (100 - 43))
            );
            bgImage.setPixel(x, y, c);
        }
    }
    sf::Texture bgTexture;
    bgTexture.loadFromImage(bgImage);
    sf::Sprite bgSprite(bgTexture);

    // Load a custom font (put "Poppins-Bold.ttf" in the same directory, or use any .ttf)
    sf::Font font;
    if (!font.loadFromFile("Poppins-Bold.ttf")) {
        // Fallback to default font, or handle error
        return 1;
    }

    sf::Text title("LookList", font, 48);
    title.setFillColor(sf::Color(192,192,192));
    title.setPosition(180, 40);

    sf::Text desc("Discover, book, and pay for premium beauty services\nnear you — hair, nails, henna, makeup, and more.", font, 20);
    desc.setFillColor(sf::Color::White);
    desc.setPosition(60, 120);

    sf::RectangleShape button(sf::Vector2f(220, 56));
    button.setPosition(190, 250);
    button.setFillColor(sf::Color(255,56,100));
    button.setOutlineThickness(2);
    button.setOutlineColor(sf::Color(201,24,74));

    sf::Text btnText("Search Near Me", font, 24);
    btnText.setFillColor(sf::Color::White);
    btnText.setPosition(202, 260);

    while (window.isOpen()) {
        sf::Event event;
        while (window.pollEvent(event)) {
            if (event.type == sf::Event::Closed)
                window.close();
        }
        window.clear();
        window.draw(bgSprite);
        window.draw(title);
        window.draw(desc);
        window.draw(button);
        window.draw(btnText);
        window.display();
    }
    return 0;
}