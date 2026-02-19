import * as React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  Building2,
  Tag as TagIcon,
  Calendar,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { getDirectusPublicUrl } from '../../lib/config';

interface UseCase {
  id: string;
  title: string;
  shortdesc: string;
  category: string;
  content: string;
  tags: string[] | string | null;
  slug: string;
  image: string | null;
}

interface Props {
  useCases: UseCase[];
}

export default function UseCaseTabs({ useCases }: Props) {
  const directusUrl = getDirectusPublicUrl();

  // Get unique categories and filter out nulls
  const categories = React.useMemo(() => {
    return Array.from(new Set(useCases.map((uc) => uc.category))).filter((c): c is string => !!c);
  }, [useCases]);

  // Initial tab selection from URL or first category
  const [activeTab, setActiveTab] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get('category');
      if (categoryParam && categories.includes(categoryParam)) {
        return categoryParam;
      }
    }
    return categories[0];
  });

  // Fallback for empty data
  if (useCases.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
        <LayoutGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest">No use cases found</p>
      </div>
    );
  }

  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-col gap-12">
        {/* Navigation Tabs */}
        <Tabs.List className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-3 p-2 bg-gray-100/50 rounded-2xl w-full md:w-fit mx-auto border border-gray-200/50 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <Tabs.Trigger
              key={category}
              value={category}
              className="group px-8 py-3.5 text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-300 
              data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-200
              text-gray-500 hover:text-gray-900 hover:bg-white"
            >
              {category}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Content Tabs */}
        {categories.map((category) => {
          const filteredItems = useCases.filter((uc) => uc.category === category);

          return (
            <Tabs.Content
              key={category}
              value={category}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {filteredItems.map((item) => {
                  // Parse tags if it's a string
                  const tagsArray = Array.isArray(item.tags)
                    ? item.tags
                    : (typeof item.tags === 'string' ? item.tags.split(',').map(t => t.trim()) : []);

                  return (
                    <div
                      key={item.id}
                      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden"
                    >
                      {/* Image Area */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                        {item.image ? (
                          <img
                            src={`${directusUrl}/assets/${item.image}`}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 italic font-medium">
                            No Image Available
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-6 md:p-8 flex flex-col flex-1">
                        <h3 className="text-2xl font-black text-gray-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>

                        <div
                          className="text-gray-600 line-clamp-3 mb-8 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.shortdesc }}
                        />

                        <div className="mt-auto pt-6 border-t border-gray-50">
                          {/* Tags Chips */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {tagsArray.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[11px] font-bold text-gray-500 uppercase tracking-tight hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 transition-colors"
                              >
                                <TagIcon className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>

                          <a
                            href={`/use-cases/${item.slug}`}
                            className="inline-flex items-center text-sm font-black text-blue-600 uppercase tracking-widest group/link"
                          >
                            Baca Lebih Lanjut
                            <ChevronRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Tabs.Content>
          );
        })}
      </div>
    </Tabs.Root>
  );
}
