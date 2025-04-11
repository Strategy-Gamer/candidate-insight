"use client"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
    TableHead,
} from "@/components/ui/table";
import { 
  CheckOutlined,
} from "@ant-design/icons"
import { PoliticalCategory, Issue } from '@/types/issues';
import { politicalCategories } from '@/utils/politicalCategories';
import '@/styles/components/candidateposition.css';

  
interface Props {
    categories: PoliticalCategory[];
    // issues: PoliticalIssue[];
    // positions: CandidatePosition[];
}

const IssuesAccordionTable = ({ categories }: Props) => {
    return (
      <div className="flex flex-col flex-start justify-center p-10 bg-white m-auto max-w-[80%] overflow-hidden gap-12">
        <h2 className="flex-row text-center font-serif text-[20pt] font-medium text-[#1c1c84]">Political Stances</h2>
        {categories.map((category) => (
          <section key={category.category} className="border rounded-none p-6">
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold">{category.category}</h2>
                <p className="text-muted-foreground">{category.category_description}</p>
              </div>
            </div>  
            <Accordion type="multiple" className="w-full">
                <AccordionItem key="key" value="value">
                  <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-gray-50 rounded-none">
                    Issue
                  </AccordionTrigger>                  
                  <AccordionContent className="px-4 pb-4">
                        <Table className="font-sans">
                          <TableBody>
                            <TableRow>
                              <TableHead className="font-medium w-[120px]">Position</TableHead>
                              <TableHead>Key Points</TableHead>
                              <TableHead className="text-right">Source</TableHead>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                <CheckOutlined /> Supports
                              </TableCell>
                              <TableCell>
                                <ul>
                                  <li>Lorem ipsum</li>
                                  <li>Lorem ipsum</li>
                                  <li>Lorem ipsum</li>
                                </ul>
                              </TableCell>
                              <TableCell className="text-right">
                                <ul>
                                  <li><a href="#" target="_blank">Tweet</a> (2024)</li>
                                  <li><a href="#" target="_blank">Debate Transcript</a> (2024)</li>
                                </ul>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                  </AccordionContent>
                </AccordionItem>
            </Accordion>
          </section>
        ))};
      </div>
    );
  };

export default IssuesAccordionTable;