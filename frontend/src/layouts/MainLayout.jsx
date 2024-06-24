import Header from "../components/Layout/Header/Header";
import Footer from "../components/Layout/Footer/Footer";

const MainLayout = ({children}) => {
    return (
        <div>
            <Header/>
            {children}
            <Footer/>
        </div>
    )
}

export default MainLayout
