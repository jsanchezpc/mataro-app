describe("Home con mock API", () => {
  it("renderiza posts mockeados", () => {
    const fakePosts = [
      {
        id: "1",
        author: "Joodda",
        content: "Post de prueba",
        uid: "abc123",
        timestamp: Date.now(),
        rt: 0,
        likes: 0,
        comments: [],
      },
    ]

    cy.intercept("GET", "/api/posts", fakePosts).as("getPosts")

    cy.visit("/")
    cy.wait("@getPosts")

    cy.contains("Post de prueba").should("be.visible")
  })
})

describe("Crear post (con sheet modal)", () => {
  it("crea un post y muestra la previsualización", () => {
    const fakePost = {
      id: "abc123",
      uid: "user1",
      author: "Tester",
      content: "Post de prueba",
      timestamp: Date.now(),
      rt: 0,
      likes: 0,
      comments: [],
    }

    cy.intercept("POST", "/api/posts", { statusCode: 200, body: fakePost }).as("createPost")
    cy.intercept("GET", "/api/posts", [fakePost]).as("getPosts")

    cy.visit("/")

    // abre el modal
    cy.get("button").contains("Crear post").click()

    // escribe en el textarea
    cy.get("textarea").type("Post de prueba")

    // previsualización aparece
    cy.contains("Previsualización de tu post:").should("exist")
    cy.contains("Post de prueba").should("exist")

    // publica
    cy.contains("Postear").click()
    cy.wait("@createPost")

    // revisa que el post aparece en el feed
    cy.contains("Post de prueba").should("exist")
  })
})

