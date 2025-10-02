import { useState } from "react";
import "./App.css";
import { useImmer, type DraftFunction } from "use-immer";
import * as SS from "superstruct";

const Names = SS.record(SS.string(), SS.string());
type Names = SS.Infer<typeof Names>;
const Family = SS.object({
  name: SS.string(),
  members: SS.array(SS.string()),
});
type Family = SS.Infer<typeof Family>;
const Families = SS.array(Family);

type Assignment = string[];

export function App() {
  const [assignments, setAssignments] = useState([] as Assignment[]);

  const [familyMode, _setFamilyMode] = useState("list");

  // const [families, setFamilies] = useImmer({
  //   Alice: "Jones",
  //   Carlos: "Lopez",
  // } as Families);
  const [families, setFamilies] = useImmer([
    { name: "Jones", members: ["Alice", "Bob"] },
    { name: "Lopez", members: ["Carlos", "Dawn"] },
  ] as Family[]);

  return (
    <div className="vbox">
      <h1>Giftdraw</h1>
      <div className="hbox gap">
        <div className="card vbox">
          <h2>Families</h2>

          <div>
            <button
              onClick={() => {
                const json = prompt(
                  `Input names in the format { "name": "family" }`
                );
                if (!json) return;
                let names;
                try {
                  names = Names.mask(JSON.parse(json));
                } catch (e) {
                  if (e instanceof Error) {
                    alert(e.message);
                  } else {
                    console.error(e);
                  }
                }
                if (names) {
                  const familyNames = [...new Set(Object.values(names))];
                  const families_ = familyNames.map((f) => ({
                    name: f,
                    members: Object.entries(names)
                      .filter(([_, n]) => n === f)
                      .map(([n, _]) => n),
                  }));
                  setFamilies(families_);
                }
              }}
            >
              Input JSON
            </button>
          </div>

          <div className="expand-1">
            {familyMode === "JSON" ? (
              <FamiliesJson families={families} setFamilies={setFamilies} />
            ) : (
              families.map((f, i) => {
                return (
                  <div key={i}>
                    <input
                      value={f.name}
                      onChange={({ target }) =>
                        setFamilies((draft) => {
                          draft[i].name = target.value;
                        })
                      }
                    />
                    <ul>
                      {f.members.map((m, j) => {
                        return (
                          <li>
                            <input
                              value={m}
                              onChange={({ target }) =>
                                setFamilies((draft) => {
                                  draft[i].members[j] = target.value;
                                })
                              }
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            )}
          </div>

          <div className="hbox reverse fit">
            <button
              onClick={() => setAssignments(computeAssignments(families))}
            >
              Draw!
            </button>
          </div>
        </div>
        <Assignments assignments={assignments} />
      </div>
    </div>
  );
}

function FamiliesJson({
  families,
  setFamilies,
}: {
  families: Family[];
  setFamilies: (arg: Family[] | DraftFunction<Family[]>) => void;
}) {
  const [parseError, setParseError] = useImmer(undefined as string | undefined);

  return (
    <>
      <textarea
        name="Families"
        id="families"
        onChange={({ target }) => {
          let f;
          try {
            f = Families.mask(JSON.parse(target.value));
          } catch (e) {
            if (e instanceof Error) {
              setParseError(e.message);
            } else {
              console.error(e);
            }
          }
          if (f) {
            setParseError(undefined);
            setFamilies(f);
          }
        }}
      >
        {JSON.stringify(families, undefined, 2)}
      </textarea>
      {parseError && <div className="error">{parseError}</div>}
    </>
  );
}

function Assignments({ assignments }: { assignments: Assignment[] }) {
  return (
    <div className="card vbox">
      <h2>Assigments</h2>
      <div>
        <ul>
          {assignments.map(([n1, n2], i) => {
            return (
              <li key={i}>
                {n1} {" -> "} {n2}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[]) {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function computeAssignments(
  fams: Family[],
  prevYears: Names[] = []
): Assignment[] {
  const solutions: string[] = [];
  const families = Object.fromEntries(
    fams.flatMap(({ name, members }) => members.map((m) => [m, name]))
  );
  const names = Object.keys(families);
  let pairs, differentFamily, noRepeats;
  for (let i = 0; i < 1000; i++) {
    let attempts = 0;
    do {
      const names2 = shuffle(names);
      pairs = names.map((_, i) => [names[i], names2[i]]);
      differentFamily = pairs.every(([g, r]) => families[g] !== families[r]);
      noRepeats = pairs.every(([g, r]) => !prevYears.some((y) => y[g] === r));
      attempts++;
    } while (attempts < 10_000 && (!differentFamily || !noRepeats));
    solutions.push(pairs.map(([_, r]) => r).join("|"));
  }

  if (solutions.length === 0) {
    return [];
  }

  const allAssignments = [...new Set(solutions)]
    .sort()
    .map((s) => s.split("|").map((r, i) => [names[i], r]));

  return shuffle(allAssignments)[0];
}
