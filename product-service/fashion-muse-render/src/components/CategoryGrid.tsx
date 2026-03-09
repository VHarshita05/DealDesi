import catMen from "@/assets/cat-men.jpg";
import catWomen from "@/assets/cat-women.jpg";

const categories = [
  { name: "Men", image: catMen, discount: "40-70% OFF" },
  { name: "Women", image: catWomen, discount: "50-80% OFF" },
];

const CategoryGrid = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Shop by Category
        </h2>
        <p className="text-muted-foreground mt-2 font-body">Find your perfect style</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {categories.map((cat) => (
          <a
            key={cat.name}
            href="#"
            className="group relative rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1"
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">{cat.name}</h3>
              <span className="inline-block mt-1 text-sm font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                {cat.discount}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
