import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
  useClerk,
} from "@clerk/clerk-react";
import { categories } from "./data/categories";
import CartPanel from "./CartPanel";
import AdminPanel from "./AdminPanel";
import ProductDetail from "./ProductDetail";
import type { Id } from "../convex/_generated/dataModel";
import MyOrders from "./MyOrders";
import OrderReceipt from './OrderReceipt';
import { imageUrl } from './imageUrl';

type IconName =
  | "bag"
  | "search"
  | "arrow"
  | "truck"
  | "shield"
  | "headset"
  | "grid"
  | "user"
  | "heart"
  | "star"
  | "phone"
  | "laptop"
  | "audio"
  | "network"
  | "storage"
  | "lock"
  | "return"
  | "home"
  | "tag"
  | "check";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    bag: (
      <>
        <path d="M6 8h12l1 12H5L6 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    truck: (
      <>
        <path d="M3 6h11v10H3z" />
        <path d="M14 10h3l3 3v3h-6z" />
        <circle cx="7" cy="18" r="1.5" />
        <circle cx="17" cy="18" r="1.5" />
      </>
    ),
    shield: <path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" />,
    headset: (
      <>
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 14h3v5H5a1 1 0 0 1-1-1v-4Zm16 0h-3v5h2a1 1 0 0 0 1-1v-4Z" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    heart: (
      <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.4a5.5 5.5 0 0 0-.1-7.8Z" />
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    phone: (
      <>
        <rect x="7" y="3" width="10" height="18" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
    laptop: (
      <>
        <rect x="4" y="5" width="16" height="11" rx="1" />
        <path d="M2 19h20" />
      </>
    ),
    audio: (
      <>
        <path d="M4 14h4l5 4V6L8 10H3z" />
        <path d="M16 9a4 4 0 0 1 0 6" />
      </>
    ),
    network: (
      <>
        <path d="M4 10h16l-2 9H6z" />
        <path d="M8 10V6h8v4" />
      </>
    ),
    storage: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 9h8M8 15h.01M12 15h.01" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    return: (
      <>
        <path d="M9 14 4 9l5-5" />
        <path d="M4 9h10a6 6 0 0 1 6 6v3" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </>
    ),
    tag: (
      <>
        <path d="M20 13 13 20 3 10V3h7l7 7Z" />
        <circle cx="7.5" cy="7.5" r="1" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const categoryIcons: IconName[] = [
  "laptop",
  "phone",
  "audio",
  "network",
  "storage",
];

function App() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] =
    useState<Id<"products"> | null>(null);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const products = useQuery(api.products.listProducts);
  const cart = useQuery(api.cart.getCart);
  const addToCart = useMutation(api.cart.addToCart);
  const createUser = useMutation(api.users.createUser);
  const currentUser = useQuery(api.users.getCurrentUser);
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const cartCount = cart?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const filteredProducts = useMemo(
    () =>
      products?.filter((product) => {
        const query = search.trim().toLowerCase();
        return (
          (activeCategory === null ||
            product.category === activeCategory ||
            categories.some(
              (category) =>
                category.name === activeCategory &&
                (product.category === category.name ||
                  category.subcategories.includes(product.category)),
            )) &&
          (!query ||
            `${product.name} ${product.description} ${product.category}`
              .toLowerCase()
              .includes(query))
        );
      }),
    [activeCategory, products, search],
  );

  const featuredProduct = products?.find((product) => product.images[0]);
  const showSignIn = (callback?: () => void) =>
    isSignedIn ? callback?.() : openSignIn();

  const handleAdd = async (productId: Id<"products">) => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    try {
      await createUser({});
      await addToCart({ productId, quantity: 1 });
      setCartMessage("Added to your cart");
      window.setTimeout(() => setCartMessage(null), 2500);
    } catch (error) {
      setCartMessage(
        error instanceof Error
          ? error.message
          : "Unable to add this item to your cart",
      );
    }
  };

  const selectCategory = (subcategory: string | null) => {
    setActiveCategory(subcategory);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };
  
  if (adminOpen) return <AdminPanel onClose={() => setAdminOpen(false)} />;
  if (selectedProductId)
    return (
      <ProductDetail
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
      />
    );
  if (ordersOpen) return <MyOrders onClose={() => setOrdersOpen(false)} />;
  if (receiptOpen) return <OrderReceipt onClose={() => setReceiptOpen(false)} />;

  return (
    <div className="shop-page">
      <div className="utility-bar">
        <span>
          <Icon name="truck" size={13} /> Free shipping in Nairobi on orders
          over KSh 10,000
        </span>
        <i />
        <span>
          <Icon name="return" size={13} /> 7 day easy returns
        </span>
        <i />
        <span>
          <Icon name="lock" size={13} /> Secure payments
        </span>
      </div>
      <header>
        <div className="top-nav">
          <button className="brand" onClick={() => selectCategory(null)}>
            <span className="brand-mark">N</span>
            <span>NEURA</span>
            <b>TECH</b>
          </button>
          <label className="search-bar">
            <Icon name="search" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
              placeholder="Search products, brands and more"
            />
          </label>
          <div className="nav-actions">
            <SignedIn>
              <button className="nav-icon" onClick={() => setOrdersOpen(true)}>
                <Icon name="user" size={19} />
                <span>Orders</span>
              </button>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="nav-icon">
                  <Icon name="user" size={19} />
                  <span>Account</span>
                </button>
              </SignInButton>
            </SignedOut>
            {(currentUser?.role === "admin" ||
              currentUser?.role === "staff") && (
              <button className="nav-icon" onClick={() => setAdminOpen(true)}>
                Admin
              </button>
            )}
            <SignedIn>
              <UserButton />
            </SignedIn>
            <button className="nav-icon" onClick={() => showSignIn()}>
              <Icon name="heart" size={19} />
              <span>Saved</span>
            </button>
            <button
              className="nav-icon cart-link"
              onClick={() => showSignIn(() => setCartOpen(true))}
            >
              <span className="count">{cartCount}</span>
              <Icon name="bag" size={20} />
              <span>Cart</span>
            </button>
          </div>
        </div>
        <nav className="menu-nav">
          <button
            className="all-categories"
            onClick={() => selectCategory(null)}
          >
            <Icon name="grid" size={15} />
            All categories
          </button>
          <button
            onClick={() => selectCategory(null)}
            className={activeCategory === null ? "active" : ""}
          >
            Home
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => selectCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
          <button
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            New arrivals
          </button>
        </nav>
      </header>
      <main>
        {cartMessage && (
          <div className="cart-notice" role="status">
            {cartMessage}
          </div>
        )}
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">SMARTER EVERYDAY TECH</p>
            <h1>
              Elevate your
              <br />
              everyday setup.
            </h1>
            <p>
              Discover trusted devices, accessories and essentials chosen to
              keep your life moving.
            </p>
            <button
              className="dark-button"
              onClick={() =>
                document
                  .getElementById("products")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Shop now <Icon name="arrow" size={16} />
            </button>
            <div className="hero-badges">
              <span>
                <Icon name="shield" size={18} />
                Verified quality
              </span>
              <span>
                <Icon name="tag" size={18} />
                Fair pricing
              </span>
              <span>
                <Icon name="headset" size={18} />
                Local support
              </span>
            </div>
          </div>
          <div className="hero-visual">
            {featuredProduct?.images[0] ? (
              <img src={imageUrl(featuredProduct.images[0])} alt="Featured product" />
            ) : (
              <Icon name="laptop" size={130} />
            )}
            <div className="sale-stamp">
              <span>SEASON</span>
              <b>SALE</b>
              <small>Up to 30% off</small>
            </div>
          </div>
        </section>
        <section className="quick-categories">
          {categories.map((category, index) => (
            <button
              key={category.name}
              onClick={() => selectCategory(category.name)}
            >
              <span className={`circle tone-${index + 1}`}>
                <Icon name={categoryIcons[index]} size={25} />
              </span>
              <b>{category.name}</b>
            </button>
          ))}
          <button onClick={() => selectCategory(null)}>
            <span className="circle tone-all">
              <Icon name="grid" size={25} />
            </span>
            <b>View all</b>
          </button>
        </section>
        <section id="products" className="product-shelf">
          <div className="shelf-heading">
            <h2>{activeCategory ?? "Top picks for you"}</h2>
            <button onClick={() => selectCategory(null)}>
              See all products <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="shelf-grid" aria-label="Products; scroll horizontally for more">
            {filteredProducts?.map((product) => (
              <article key={product._id} className="product-card">
                <button
                  className="product-photo"
                  onClick={() => setSelectedProductId(product._id)}
                >
                  <img src={imageUrl(product.images[0])} alt={product.name} />
                  {product.stock > 0 && <span>Available</span>}
                </button>
                <div className="product-details">
                  <p>{product.category}</p>
                  <button
                    className="product-name"
                    onClick={() => setSelectedProductId(product._id)}
                  >
                    {product.name}
                  </button>
                  <small>
                    <Icon name="star" size={12} /> Quality checked
                  </small>
                  <div>
                    <strong>KSh {product.price.toLocaleString()}</strong>
                    <button
                      className="round-cart"
                      onClick={() => handleAdd(product._id)}
                      disabled={product.stock === 0}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <Icon name="bag" size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {filteredProducts?.length === 0 && (
            <div className="empty-state">
              <Icon name="search" size={27} />
              <h3>No products found</h3>
              <p>Try another search or category.</p>
            </div>
          )}
        </section>
        <section className="promo-row">
          <article className="promo-card promo-one">
            <div>
              <p>COMPUTING</p>
              <h3>
                Work smarter
                <br />
                every day.
              </h3>
              <button onClick={() => selectCategory("Laptops")}>
                Shop now <Icon name="arrow" size={15} />
              </button>
            </div>
            {featuredProduct?.images[0] && (
                <img src={imageUrl(featuredProduct.images[0])} alt="Computing collection" />
            )}
          </article>
          <article className="promo-card promo-two">
            <div>
              <p>HOME OFFICE</p>
              <h3>
                Make your space
                <br />
                work harder.
              </h3>
              <button onClick={() => selectCategory("Computer Accessories")}>
                Shop now <Icon name="arrow" size={15} />
              </button>
            </div>
            <span>
              <Icon name="laptop" size={70} />
            </span>
          </article>
          <article className="promo-card promo-three">
            <div>
              <p>AUDIO ESSENTIALS</p>
              <h3>
                Hear every
                <br />
                detail.
              </h3>
              <button onClick={() => selectCategory("Headphones")}>
                Shop now <Icon name="arrow" size={15} />
              </button>
            </div>
            <span>
              <Icon name="audio" size={70} />
            </span>
          </article>
        </section>
        <section className="proof-section">
          <div className="proof-title">
            <h2>Trusted by local shoppers</h2>
            <span>
              <b>4.8/5</b> average rating <Icon name="star" size={15} />
              <Icon name="star" size={15} />
              <Icon name="star" size={15} />
              <Icon name="star" size={15} />
              <Icon name="star" size={15} />
            </span>
          </div>
          <div className="review-grid">
            <article>
              <span className="review-avatar">AM</span>
              <div>
                <b>Anne M.</b>
                <small>Verified customer</small>
                <p>
                  “Clear product details and delivery that arrived exactly when
                  expected.”
                </p>
              </div>
            </article>
            <article>
              <span className="review-avatar amber">JK</span>
              <div>
                <b>James K.</b>
                <small>Verified customer</small>
                <p>
                  “The ordering process was simple and the device was exactly as
                  described.”
                </p>
              </div>
            </article>
            <article>
              <span className="review-avatar blue">RW</span>
              <div>
                <b>Ruth W.</b>
                <small>Verified customer</small>
                <p>
                  “Helpful support and excellent quality. I will definitely shop
                  here again.”
                </p>
              </div>
            </article>
          </div>
        </section>
        <section className="newsletter">
          <span className="mail-mark">
            <Icon name="arrow" size={27} />
          </span>
          <div>
            <h2>Stay in the loop</h2>
            <p>New stock, useful offers and practical buying guides.</p>
          </div>
          <form onSubmit={(event) => event.preventDefault()}>
            <input
              aria-label="Email address"
              type="email"
              placeholder="Your email address"
            />
            <button type="submit">Subscribe</button>
          </form>
        </section>
        <section className="service-strip">
          <article>
            <Icon name="truck" size={25} />
            <div>
              <b>Fast delivery</b>
              <span>Across Kenya</span>
            </div>
          </article>
          <article>
            <Icon name="return" size={25} />
            <div>
              <b>Easy returns</b>
              <span>7 day return window</span>
            </div>
          </article>
          <article>
            <Icon name="lock" size={25} />
            <div>
              <b>Secure payments</b>
              <span>Protected checkout</span>
            </div>
          </article>
          <article>
            <Icon name="headset" size={25} />
            <div>
              <b>Helpful support</b>
              <span>Here when you need us</span>
            </div>
          </article>
        </section>
      </main>
      <footer>
        <div className="footer-grid">
          <div>
            <button
              className="brand footer-brand"
              onClick={() => selectCategory(null)}
            >
              <span className="brand-mark">N</span>
              <span>NEURA</span>
              <b>TECH</b>
            </button>
            <p>
              Your local shop for practical technology and thoughtful service.
            </p>
          </div>
          <div>
            <h3>Shop</h3>
            <button onClick={() => selectCategory(null)}>All categories</button>
            <button onClick={() => selectCategory("Laptops")}>
              Laptops and computers
            </button>
            <button onClick={() => selectCategory("Smartphones")}>
              Phones and tablets
            </button>
            <button onClick={() => selectCategory("Headphones")}>Audio</button>
          </div>
          <div>
            <h3>Customer service</h3>
            <a>Track your order</a>
            <a>Delivery and returns</a>
            <a>Payment information</a>
            <a>Contact us</a>
          </div>
          <div>
            <h3>About NeuraTech</h3>
            <a>Our story</a>
            <a>Careers</a>
            <a>Help centre</a>
            <a>Privacy notice</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 NeuraTech Kenya. All rights reserved.</span>
          <span>Terms of service</span>
          <span>Privacy notice</span>
        </div>
      </footer>
      {cartOpen && <CartPanel onClose={() => setCartOpen(false)} />}
    </div>
  );
}

export default App;