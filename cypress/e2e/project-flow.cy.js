describe("Project Creation and Editing Flow", () => {
  beforeEach(() => {
    // Assuming we have a mock authentication endpoint
    cy.request("POST", "/api/mock-auth", {
      username: "testuser",
      password: "testpass",
    }).then((response) => {
      window.localStorage.setItem("authToken", response.body.token);
    });
  });

  it("allows a user to create a new project and edit it", () => {
    // Visit the home page
    cy.visit("/");

    // Create a new project
    cy.contains("Create Project").click();
    cy.get('input[name="projectName"]').type("Test Project");
    cy.contains("Submit").click();

    // Verify that the project was created
    cy.contains("Test Project").should("be.visible");

    // Open the project
    cy.contains("Test Project").click();

    // Verify that the code editor is present
    cy.get(".monaco-editor").should("be.visible");

    // Type some code
    cy.get(".monaco-editor").type('console.log("Hello, World!");');

    // Save the project
    cy.contains("Save").click();

    // Verify that the save was successful
    cy.contains("Project saved successfully").should("be.visible");

    // Reload the page to ensure our changes persisted
    cy.reload();

    // Verify our code is still there
    cy.get(".monaco-editor").should(
      "contain.text",
      'console.log("Hello, World!");'
    );
  });
});
