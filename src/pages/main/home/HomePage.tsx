export const HomePage = () => {
    // Try to show something from query parameter
    const name = new URLSearchParams(window.location.search).get("name");

    return(
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <h1>Home page</h1>
            {name && <p>Welcome, {name}!</p>}
        </div>
    )
}