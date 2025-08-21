import javax.swing.*;
import java.awt.*;

public class BeautyLanding extends JFrame {
    public BeautyLanding() {
        setTitle("LookList – Luxury Beauty Marketplace");
        setSize(600, 400);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        // Custom panel for background and font
        JPanel panel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                // Gradient background
                Graphics2D g2d = (Graphics2D) g;
                GradientPaint gp = new GradientPaint(0, 0, new Color(24,18,43), getWidth(), getHeight(), new Color(255,56,100));
                g2d.setPaint(gp);
                g2d.fillRect(0, 0, getWidth(), getHeight());
            }
        };
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));

        // Use Google Fonts like Poppins or Inter if installed, fallback otherwise
        Font headerFont = new Font("Poppins", Font.BOLD, 32);
        Font descFont = new Font("Inter", Font.PLAIN, 18);

        JLabel title = new JLabel("LookList");
        title.setFont(headerFont);
        title.setForeground(new Color(192,192,192));
        title.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel desc = new JLabel("<html><div style='text-align: center;'>Discover, book, and pay for <span style='color:#ff3864;'>premium beauty services</span> near you — hair, nails, henna, makeup, and more.</div></html>");
        desc.setFont(descFont);
        desc.setForeground(Color.WHITE);
        desc.setAlignmentX(Component.CENTER_ALIGNMENT);

        JButton ctaBtn = new JButton("Search Near Me");
        ctaBtn.setFont(headerFont.deriveFont(18f));
        ctaBtn.setForeground(Color.WHITE);
        ctaBtn.setBackground(new Color(255,56,100));
        ctaBtn.setAlignmentX(Component.CENTER_ALIGNMENT);
        ctaBtn.setFocusPainted(false);

        panel.add(Box.createVerticalGlue());
        panel.add(title);
        panel.add(Box.createRigidArea(new Dimension(0, 20)));
        panel.add(desc);
        panel.add(Box.createRigidArea(new Dimension(0, 30)));
        panel.add(ctaBtn);
        panel.add(Box.createVerticalGlue());

        add(panel);
    }

    public static void main(String[] args) {
        // Set Look and Feel to system default
        try { UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName()); } catch (Exception e) {}
        SwingUtilities.invokeLater(() -> new BeautyLanding().setVisible(true));
    }
}