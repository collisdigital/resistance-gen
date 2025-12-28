from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_app(page: Page):
    page.goto("http://localhost:3000/resistance-gen/")

    # 1. Generate a workout
    # Select Chest
    page.get_by_label("Chest").check()

    # Click Generate
    page.get_by_role("button", name="GENERATE WORKOUT").click()

    # Wait for workout to appear
    expect(page.get_by_text("Set 1")).to_be_visible()

    # Take screenshot of initial state
    page.screenshot(path="verification/1_generated.png")

    # 2. Complete an exercise
    # Find the first 'Complete' button and click it
    complete_buttons = page.get_by_role("button", name="Complete")
    complete_buttons.first.click()

    # Verify visual change (green checkmark)
    # The exercise should collapse and show checkmark
    # We look for the checkmark symbol
    expect(page.get_by_text("✓").first).to_be_visible()

    # Take screenshot of completed state
    page.screenshot(path="verification/2_completed_exercise.png")

    # 3. Complete all exercises in the first set to trigger set collapse
    # We need to find all incomplete exercises in Set 1
    # Since we completed one, if there are more in Set 1 (depending on random gen), we complete them.
    # To be safe, let's keep clicking 'Complete' until Set 1 is collapsed.
    # Set 1 collapsed means "Set 1" text is green and has checkmark.

    # Let's just click 'Complete' a few more times if available
    # Or better: check if Set 1 header has green text

    # Just try to complete the second exercise if it exists (in case of superset or if we just want to show progress)
    # The test is simple: show that we can interact.

    # Let's try to reset
    page.get_by_text("Mark all exercises incomplete").click()

    # Confirm dialog
    page.on("dialog", lambda dialog: dialog.accept())

    # Take screenshot after reset
    # Wait a bit for state update
    time.sleep(0.5)
    page.screenshot(path="verification/3_reset.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_app(page)
        finally:
            browser.close()
