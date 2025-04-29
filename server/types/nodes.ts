/**
 * Enum for all possible node types
 */
export enum NodeType {
  Root = "root",
  Section = "section",
  Text = "text",
  Template = "template",
  See = "see",
  Do = "do",
  Buy = "buy",
  Eat = "eat",
  Drink = "drink",
  Sleep = "sleep",
  Listing = "listing",
  Marker = "marker",
}

/**
 * Base interface for all node types in the Wikivoyage tree
 */
export interface BaseNode {
  /** Type identifier for the node */
  type: NodeType;
  /** Properties specific to this node type */
  properties: Record<string, any>;
  /** Child nodes */
  children: WikiNode[];
}

/**
 * Root node of the document
 */
export interface RootNode extends BaseNode {
  type: NodeType.Root;
  properties: {
    /** Page banner information */
    pagebanner?: {
      [key: string]: string;
    };
    /** Map frame information */
    mapframe?: {
      [key: string]: string;
    };
    /** Route box information */
    routebox?: {
      [key: string]: string;
    };
    /** Geographic coordinates */
    geo?: {
      [key: string]: string;
    };
    /** Parent region information */
    isPartOf?: {
      [key: string]: string;
    };
    /** City status information */
    usablecity?: {
      [key: string]: string;
    };
    guidecity?: {
      [key: string]: string;
    };
    outlinecity?: {
      [key: string]: string;
    };
    title: string;
  };
}

/**
 * Section node representing a heading and its content
 */
export interface SectionNode extends BaseNode {
  type: NodeType.Section;
  properties: {
    /** Section title */
    title: string;
    /** Heading level (1-6) */
    level: number;
  };
}

/**
 * Text node containing markdown content
 */
export interface TextNode extends BaseNode {
  type: NodeType.Text;
  properties: {
    /** Markdown formatted text */
    markdown: string;
  };
}

/**
 * Generic template node for templates not specifically handled
 */
export interface TemplateNode extends BaseNode {
  type: NodeType.Template;
  properties: {
    /** Template name */
    name: string;
    /** Template parameters */
    params: {
      [key: string]: string;
    };
  };
}

/**
 * Base interface for listing templates (see, do, buy, eat, drink, sleep)
 */
export interface ListingNode extends BaseNode {
  properties: {
    /** Name of the listing */
    name: string;
    /** Alternative name */
    alt?: string;
    /** URL for the listing */
    url?: string;
    /** Email address */
    email?: string;
    /** Physical address */
    address?: string;
    /** Latitude coordinate */
    lat?: string;
    /** Longitude coordinate */
    long?: string;
    /** Directions to reach the location */
    directions?: string;
    /** Phone number */
    phone?: string;
    /** Toll-free phone number */
    tollfree?: string;
    /** Fax number */
    fax?: string;
    /** Opening hours */
    hours?: string;
    /** Price information */
    price?: string;
    /** Last edit timestamp */
    lastedit?: string;
    /** Wikipedia article name */
    wikipedia?: string;
    /** Wikidata ID */
    wikidata?: string;
    /** Image filename */
    image?: string;
    /** Description content */
    content?: string;
  };
}

/**
 * See listing (attractions, landmarks)
 */
export interface SeeNode extends ListingNode {
  type: NodeType.See;
}

/**
 * Do listing (activities)
 */
export interface DoNode extends ListingNode {
  type: NodeType.Do;
}

/**
 * Buy listing (shopping)
 */
export interface BuyNode extends ListingNode {
  type: NodeType.Buy;
}

/**
 * Eat listing (restaurants)
 */
export interface EatNode extends ListingNode {
  type: NodeType.Eat;
}

/**
 * Drink listing (bars, cafes)
 */
export interface DrinkNode extends ListingNode {
  type: NodeType.Drink;
}

/**
 * Sleep listing (accommodations)
 */
export interface SleepNode extends ListingNode {
  type: NodeType.Sleep;
  properties: ListingNode["properties"] & {
    /** Check-in time */
    checkin?: string;
    /** Check-out time */
    checkout?: string;
  };
}

/**
 * Generic listing node
 */
export interface GenericListingNode extends ListingNode {
  type: NodeType.Listing;
}

/**
 * Marker node for map locations
 */
export interface MarkerNode extends BaseNode {
  type: NodeType.Marker;
  properties: {
    /** Type of marker */
    type: string;
    /** Name of the location */
    name: string;
    /** Latitude coordinate */
    lat: string;
    /** Longitude coordinate */
    long: string;
  };
}

/**
 * Union type of all possible node types
 */
export type WikiNode<T extends NodeType = NodeType> = T extends NodeType.Root
  ? RootNode
  : T extends NodeType.Section
    ? SectionNode
    : T extends NodeType.Text
      ? TextNode
      : T extends NodeType.Template
        ? TemplateNode
        : T extends NodeType.See
          ? SeeNode
          : T extends NodeType.Do
            ? DoNode
            : T extends NodeType.Buy
              ? BuyNode
              : T extends NodeType.Eat
                ? EatNode
                : T extends NodeType.Drink
                  ? DrinkNode
                  : T extends NodeType.Sleep
                    ? SleepNode
                    : T extends NodeType.Listing
                      ? GenericListingNode
                      : T extends NodeType.Marker
                        ? MarkerNode
                        : never;
